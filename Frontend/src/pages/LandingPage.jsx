import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'

const LandingPage = () => {
    const router = useNavigate();

  return (
     <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>Voxora</h2>
                </div>
                <div className='navlist'>
                    <p onClick={() => {
                        router("/aljk23")
                    }}>Join as Guest</p>
                    <p onClick={() => {
                        router("/auth")

                    }}>Register</p>
                    <div onClick={() => {
                        router("/auth")

                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

      <div className="landingMainContainer">
        <div className='leftSide'>
            <h1><span style={{color : "chocolate"}}>Connect</span> with your loved ones</h1>
            <p>Where Every Voice Becomes a Classroom.</p>
            <div role='button' className='get'>
                <Link to={"/auth"}>Get Started</Link>
            </div>
        </div>
        <div className='rightSide'>
            <img src="/mobile.png" alt="" />
        </div>
      </div>
    </div>
  )
}

export default LandingPage
