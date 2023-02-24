import  {Component} from 'react'
import StudentRow from './StudentRow'


class ParentRow extends Component {

    constructor(props){
        super(props)
        this.state = {showStudents:false}
    }

    toggleShow = () =>{
        this.setState({showStudents:!this.state.showStudents})
    }

    render(){
        return(
       
        <div >
            <button className="btn btn-warning mb-5"
                onClick={this.toggleShow}
            >{'Parent - '+this.props.parent.firstName}
            
            </button>

            {this.state.showStudents?
            
            this.props.parent.students.map((student,index)=>(
               
                <StudentRow index={index} student ={student}/>
            ))
            :null}

           

            
        </div>
         
        )
    }

}

export default ParentRow