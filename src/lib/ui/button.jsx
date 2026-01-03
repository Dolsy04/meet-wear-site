
export default function Button({children, className, title}){
    return(<>
        <button className={className}>
            <span >{children}</span>
            <span className="relative">{title}</span>
        </button>
    </>)
}