

export default function Card({children, className, title}){
    return(<>
        <div className={className}>
            <h3>{title}</h3>
            {children}
        </div>
    </>)
}