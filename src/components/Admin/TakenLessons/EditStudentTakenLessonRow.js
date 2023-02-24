import {Component} from 'react'

class EditStudentTakenLessonsRow extends Component{

    constructor(props){
        super(props)
        this.state = {background:null,
                    selected:false}


    }

    setSelected = async (e) =>{
        this.props.setStudent(this.props.index);
    }

    render(){
        return(
            <div className="row btn w-100" style={{background:this.state.background}}
                onMouseOver={()=>this.setState({background:'lightblue'})}
                onMouseLeave={()=>this.setState({background:null})}
                onClick={this.setSelected}
            >
                {this.props.item._id + " " +
                this.props.item.firstName + " "+
                this.props.item.lastName
                
                }
            </div>
        )
    }
}

export default EditStudentTakenLessonsRow