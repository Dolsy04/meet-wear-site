import shoe from '../../assets/men-shoes.jpg'
export default function HeroSection() {
    return(<>
        <section className="w-full h-[350px] flex items-center justify-center flex-col bg-gray-200 relative overflow-hidden">
            <img src={shoe} alt="man-shoe" className="w-full h-full object-cover object-center"/>    
            <div className='absolute inset-0 bg-blue-500/50'></div>
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-4'>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center leading-tight drop-shadow-lg font-[Montserrat]">Step Into Style with MW-Store</h2>
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 mt-3 font-medium  text-center drop-shadow font-[Montserrat]">Premium Footwear for Every Walk of Life.</p>
            </div>
        </section>
    </>)
}