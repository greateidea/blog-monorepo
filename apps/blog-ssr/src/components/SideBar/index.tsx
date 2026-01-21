import style from './sidebar.module.css';

type SideBarType = {
    data: { code: string, des: string, href?: string }[];
    onClick?: (parm: {code: string, des: string}) => void;
    active?: string;
}

const SideBar: React.FC<SideBarType> = ({ data, onClick, active }) => {

    return <aside className={style.sidebarContainer}>
        <nav>
            <ul className={style.sidebar}>
                {
                    data.map(value => {
                        return <li className={active === value.code ? style.active : ''} key={value.code}>
                            <div className={style.liContent}>
                                <a href={value.href} onClick={(event) => {
                                    event.preventDefault();
                                    onClick?.({ code: value.code, des: value.des });
                                }}>
                                    { value.des }
                                </a>
                            </div>
                        </li>
                    })
                }
            </ul>
        </nav>
    </aside>
}

export default SideBar;

