import style from './footer.module.css'
import Links from './Links'
import { sideBarData } from '../Article'
// import LazyImage from '../LazyImage'

const Footer: React.FC = () => {
    return <footer className={style['footer']}>
        <div className={style['footer_profile_container']}>
            <Links links={sideBarData.map((bdata) => ({ link: bdata.ogUrl, des: bdata.des, code: bdata.code, date: bdata.dateStr }))}/>
            <div className={style['footer_profile']}>
                <img draggable='false' width={32} height={32} src='/logolt.png' />
                {/* <LazyImage className={style['logo-wrap']} src='/logolt.png' width={32} height={32} /> */}
                <div style={{ lineHeight: 1.3 }}>
                    <p>© {new Date().getFullYear()} Spring Cat</p>
                    <em>Design & Built in CD/CN</em>
                </div>
            </div>
        </div>
    </footer>
}

export default Footer
