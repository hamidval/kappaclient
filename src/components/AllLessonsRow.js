import {Component} from 'react'
class AllLessonsRow extends Component{

    constructor(props){
        super(props)
        this.state = {background:null,
                    selected:false}


    }

    addExtraLesson = async (e) =>{
        this.props.addExtraLesson(this.props.item);
    }
    setSelected = (e) =>{
        if(this.props.item.student !=null){
            this.props.setSelected(this.props.item);
        }
    }

    render(){
        return(
            <div>
            <div className="row btn w-100" style={{background:this.state.background}}
                onMouseOver={()=>this.setState({background:'lightblue'})}
                onMouseLeave={()=>this.setState({background:null})}
                onClick={this.setSelected}
            >
                
                {
                this.props.item.student?.firstName + " "+
                this.props.item.subject + " " +
                this.props.item.rateKey
                
                
                }
            </div>
 
        </div>
        )
    }
}

export default AllLessonsRow