import Header from '../lib/components/header'
import HeroSection from '../lib/components/heroSection'
import Shop from '../lib/components/shop'
import NewsLetters from '../lib/components/newsLetters'
import Contact from '../lib/components/contact'
import Footer from '../lib/components/footer'



export default function Homepage({products, setProducts}) {
    
    return(<>
      <Header />
      <HeroSection />
      <Shop products={products} setProducts={setProducts}/>
      <Contact />
      <NewsLetters />
      <Footer />
    </>)
}