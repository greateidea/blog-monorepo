function Promise(executor) {
    if (executor !== INTERNAL) {
        check(this, executor);
    }
    this._bitField = NO_STATE;
    this._fulfillmentHandler0 = undefined;
    this._rejectionHandler0 = undefined;
    this._promise0 = undefined;
    this._receiver0 = undefined;
    this._resolveFromExecutor(executor); // TODO:
    this._promiseCreated();
    this._fireEvent("promiseCreated", this);
}

// new Promise((r,j) => { console.log(1); r("hhh") }).catch(e => console.log(e))
Promise.prototype._resolveFromExecutor = function (executor) {
    if (executor === INTERNAL) return;
    ASSERT(typeof executor === "function");
    var promise = this;
    this._captureStackTrace();
    this._pushContext();
    var synchronous = true;

    // TODO:
    var r = this._execute(executor, function(value) {
        promise._resolveCallback(value);
    }, function (reason) {
        promise._rejectCallback(reason, synchronous);
    });
    // TODO:

    synchronous = false;
    this._popContext();

    if (r !== undefined) {
        promise._rejectCallback(r, true);
    }
};

Promise.prototype._execute = function(executor, resolve, reject) {
    try {
        executor(resolve, reject);
    } catch (e) {
        return e;
    }
};

Promise.prototype._resolveCallback = function(value, shouldBind) {
    if (BIT_FIELD_CHECK(IS_FATE_SEALED, this._bitField)) return;
    if (value === this)
        return this._rejectCallback(makeSelfResolutionError(), false);
    var maybePromise = tryConvertToPromise(value, this);
    if (!(maybePromise instanceof Promise)) return this._fulfill(value); // TODO:

    if (shouldBind) this._propagateFrom(maybePromise, PROPAGATE_BIND);


    var promise = maybePromise._target();

    if (promise === this) {
        this._reject(makeSelfResolutionError());
        return;
    }

    var bitField = promise._bitField;
    if (BIT_FIELD_CHECK(IS_PENDING_AND_WAITING_NEG)) {
        var len = this._length();
        if (len > 0) promise._migrateCallback0(this);
        for (var i = 1; i < len; ++i) {
            promise._migrateCallbackAt(this, i);
        }
        this._setFollowing();
        this._setLength(0);
        this._setFollowee(maybePromise);
    } else if (BIT_FIELD_CHECK(IS_FULFILLED)) {
        this._fulfill(promise._value());
    } else if (BIT_FIELD_CHECK(IS_REJECTED)) {
        this._reject(promise._reason());
    } else {
        var reason = new CancellationError(LATE_CANCELLATION_OBSERVER);
        promise._attachExtraTrace(reason);
        this._reject(reason);
    }
};

Promise.prototype._fulfill = function (value) {
    var bitField = this._bitField;
    if (BIT_FIELD_READ(IS_FATE_SEALED)) return;
    if (value === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._reject(err);
    }
    this._setFulfilled(); // TODO:
    this._rejectionHandler0 = value;

    if (BIT_FIELD_READ(LENGTH_MASK) > 0) {
        if (BIT_FIELD_CHECK(IS_ASYNC_GUARANTEED)) {
            this._settlePromises();  // TODO:
        } else {
            async.settlePromises(this); // TODO:
        }
        this._dereferenceTrace();
    }
};

Promise.prototype._setFulfilled = function () {
    this._bitField = this._bitField | IS_FULFILLED;
    this._fireEvent("promiseFulfilled", this);
};

Promise.prototype._settlePromises = function () {
    var bitField = this._bitField;
    var len = BIT_FIELD_READ(LENGTH_MASK);

    if (len > 0) {
        if (BIT_FIELD_CHECK(IS_REJECTED_OR_CANCELLED)) {
            var reason = this._fulfillmentHandler0;
            this._settlePromise0(this._rejectionHandler0, reason, bitField); // TODO:
            this._rejectPromises(len, reason);
        } else {
            var value = this._rejectionHandler0;
            this._settlePromise0(this._fulfillmentHandler0, value, bitField); // TODO:
            this._fulfillPromises(len, value);
        }
        this._setLength(0);
    }
    this._clearCancellationData();
};

Promise.prototype._settlePromise0 = function(handler, value, bitField) {
    var promise = this._promise0;
    var receiver = this._receiverAt(0);
    this._promise0 = undefined;
    this._receiver0 = undefined;
    this._settlePromise(promise, handler, receiver, value); // TODO:
};

Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
    ASSERT(!this._isFollowing());
    var isPromise = promise instanceof Promise;
    var bitField = this._bitField;
    var asyncGuaranteed = BIT_FIELD_CHECK(IS_ASYNC_GUARANTEED);
    if (BIT_FIELD_CHECK(IS_CANCELLED)) {
        if (isPromise) promise._invokeInternalOnCancel();

        if (receiver instanceof PassThroughHandlerContext &&
            receiver.isFinallyHandler()) {
            receiver.cancelPromise = promise;
            if (tryCatch(handler).call(receiver, value) === errorObj) {
                promise._reject(errorObj.e);
            }
        } else if (handler === reflectHandler) {
            promise._fulfill(reflectHandler.call(receiver));
        } else if (receiver instanceof Proxyable) {
            receiver._promiseCancelled(promise);
        } else if (isPromise || promise instanceof PromiseArray) {
            promise._cancel();
        } else {
            receiver.cancel();
        }
    } else if (typeof handler === "function") {
        //if promise is not instanceof Promise
        //it is internally smuggled data
        if (!isPromise) {
            handler.call(receiver, value, promise); // TODO:
        } else {
            if (asyncGuaranteed) promise._setAsyncGuaranteed();
            this._settlePromiseFromHandler(handler, receiver, value, promise);
        }
    } else if (receiver instanceof Proxyable) {
        if (!receiver._isResolved()) {
            if (BIT_FIELD_CHECK(IS_FULFILLED)) {
                receiver._promiseFulfilled(value, promise);
            } else {
                receiver._promiseRejected(value, promise);
            }
        }
    } else if (isPromise) {
        if (asyncGuaranteed) promise._setAsyncGuaranteed();
        if (BIT_FIELD_CHECK(IS_FULFILLED)) {
            promise._fulfill(value);
        } else {
            promise._reject(value);
        }
    }
};












