import React from "react";
import logo from '../robot-assistant.png'
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <div className='navbar'>
            <div className="logo">
                <Link to="/">
                    <img src={logo} alt="MediLens Logo" width="75px" />
                </Link>
                
            </div>
            <ul>
                <li>
                    <Link to="/" className="nav-link">Home</Link>
                </li>
                <li>
                    <Link to="/about" className="nav-link">About</Link>
                </li>
                <li>
                    <Link to="/analyze" className="nav-link">Features</Link>
                </li>
                {/* <li>HomePage</li>
                <li>About</li> */}
            </ul>
        </div>
    )
}

export default Navbar