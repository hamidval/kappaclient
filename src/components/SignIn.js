import React,{Component} from 'react'
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { Redirect , withRouter} from 'react-router-dom';
import { css } from "@emotion/react";
import Loader from "react-spinners/HashLoader";
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
class SignIn extends Component{


    constructor(props){
        super(props)
        this.state = {
            gid:null,
            redirect:false,
            jwt:null,
            fetchError:null,
            foods:[],
            user: this.props.user,
            showGame: false
     


        }


    }
     getJwt = async (obj) => {
        const { data } = await axios.get('/api/jwt?gid='+obj.googleId);
        localStorage.setItem('token', data.token);
        console.log(data.token)
        if(data.token == 0){
          
          alert('intruder reported')
        }
        this.setState({jwt:data.token});
      };

      onSuccessfulSignIn = (obj) => {
        this.getJwt(obj);
        
      }
      onFailedSignIn = () =>{}

       getFoods = async () => {
        try {
          const { data } = await axios.get('/api/foods');
          this.setState({foods:data})
          
        } catch (err) {
          this.setState({fetchError:err.message})
        }
      };

    componentDidMount = ()=>{


      this.props.setErrorMessage("test")

      console.log(this.props.user)

        axios.interceptors.request.use(
            config => {
              const { origin } = new URL('http://localhost:3000'+config.url);
        
              const allowedOrigins = ['http://localhost:3000'];
              const token = localStorage.getItem('token');
              
              if (allowedOrigins.includes(origin)) {
           
                config.headers.authorization = `Bearer ${token}`;
              }
              return config;
            },
            error => {
              return Promise.reject(error);
            }
          );
    }

    updateKey = (e) =>{
        this.setState({gid:e.target.value})
    }

    logIn = async (e) =>{
        var str = "/api/verify-teacher?gid="+this.state.gid


        await axios.get(str)
        .then(async response => {
            var code = response.data
            if(code == 200){
               
                this.setState({redirect:true})
            
            }else if(code == 403){

                alert('Congratulations, you played yourself')

            }else{
                alert('why')
            }
            

        });  

    }

    toggleGame = () =>{
      this.setState({showGame: !this.state.showGame})
    }


    
    render(){
        const { redirect } = this.state;
        if (redirect) {
            return <Redirect to='/EnterData'/>;
          }

        return(
            <div  >
        
            <div className="container">


              {!this.state.showGame?
                      <div  style={{marginTop:'150px'}} >
                      <div id="HomepageTitle" className="card-body" >
                      <Loader color={'#007bff'} loading={true} css={override} size={40} />  

                      <h1>{this.props.user? "Hi "+this.props.user.nickname.fullName+ "!": "Kappa-Client"} </h1>


                      {/* <div class="card card-body bg-primary mt-3">

                      </div> */}                   


                      </div>


                      </div>
                      :null
              }
               

              

            <div >
                   
            </div>

            </div>
                
                    
            
              
           

      

            </div>
        )
    }



}

export default SignIn;