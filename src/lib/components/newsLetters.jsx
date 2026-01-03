
export default function NewsLetters() {
    return (<>
        <section className="w-full bg-[#f5f5f5] my-10">
            <div className="w-[95%] mx-auto h-full py-10 flex flex-col items-center gap-4">
                <h2 className="font-[Montserrat] font-bold text-3xl text-[#212121] text-center">Subscribe to our Newsletter</h2>
                <p className="font-[Montserrat] font-normal text-sm text-center text-[#424242] w-full lg:w-[60%]">Stay updated with the latest news, exclusive offers, and special promotions directly in your inbox. Join our newsletter today!</p>
                <div className="w-full flex items-center justify-center lg:flex-row flex-col">
                    <input type="email" placeholder="Enter your email address" className="w-full lg:w-[40%] h-10 px-4 border border-gray-300 rounded-lg lg:rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button className="h-10 bg-blue-600 text-white px-6 rounded-lg lg:rounded-r-md hover:bg-blue-700 transition-colors duration-300 lg:mt-0 mt-2">Subscribe</button>
                </div>
            </div>
        </section>
    </>)
}