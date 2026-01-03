
export default function Footer() {
    return (<>
        <footer className="w-full bg-[#212121] py-6 mt-10">
            <div className="w-[95%] mx-auto h-full flex flex-col items-center gap-4">
                <p className="font-[Montserrat] font-normal text-sm text-center text-[#f5f5f5]">&copy; {new Date().getFullYear()} MeetWear. All rights reserved.</p>
            </div>
        </footer>
    </>)
}