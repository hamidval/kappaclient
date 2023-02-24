import {Component} from 'react'
import LoginButton from './Auth/LoginButton'
import LogoutButton from './Auth/LogoutButton';
import {Navbar, NavbarBrand,Collapse, Nav, NavbarToggler } from 'reactstrap'
class NavBar extends Component{

    constructor(props){
        super(props)
        this.state ={
            isAuthenticated:this.props.isAuthenticated,
            isOpen:false,
            role: this.props.role
        }


    }

    toggle = (e) =>{


        this.setState({isOpen:!this.state.isOpen})

    }


    render(){
        return(
        <div   >
     <Navbar className="container"   light expand="md">
        <NavbarBrand href="/">    <div className="">
                    <h3 style={{textAlign:'left',color:'#0066ff'}}>kappa-client</h3>
                </div>   </NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="mr-auto" navbar>
          
            
          </Nav>
         
          <div>
                {!this.state.isAuthenticated?
                    <div className="m-1" >
                        <LoginButton/>
                    </div>
                :null}
          </div>
         
          <div className="m-1">
                <LogoutButton/>
          </div>

          <div>
                {this.props.isAuthenticated?
                    <div className="m-1" >
                        <a className="btn btn-outline-primary" href={'/register'}>My Register</a>
                    </div>
                    
                :null}
          </div>

          <div>
                {this.props.isAuthenticated?
                    <div className="m-1" >
                        <a className="btn btn-outline-primary" href={'/my-lessons'}>My Lessons</a>
                    </div>
                    
                :null}
          </div>
          <div>
                {this.props.isAuthenticated && this.props.role > 0?
                    <div className="m-1" >
                        <a className="btn btn-outline-primary" href={'/admin'}>Admin</a>
                    </div>
                    
                :null}
          </div>

      

        </Collapse>
      </Navbar>
        
        </div>)
    }

}


export default NavBar