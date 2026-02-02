import "./Navbar.css"
import logo from "/src/assets/logo.webp"

const Navbar = () => {
  return (
    <nav className="content-nav">
        <img className="img-logo" src={logo}/>
        <span className="text-logo">BM-Fitness</span>
    </nav>
  )
}

export default Navbar