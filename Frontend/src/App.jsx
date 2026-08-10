
import { useEffect, useState } from "react";
import './App.css'
import api from './urlServices'
import NavBar from './otherComponents/navBar'
import Home from './otherComponents/Home'

function App() {
    return (
        <>
            <NavBar/>
            <Home />
        </>
    )
    
}

export default App
