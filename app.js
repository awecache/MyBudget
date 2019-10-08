

//Budget Controller
//internal data structure
const budgetController=(function(){
    const Expense=function(id, description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };

    Expense.prototype.calcPercentage=function(totalInc){
        if(totalInc>0){
            this.percentage=Math.round(this.value/totalInc*100);
        }else{
            this.percentage=-1;
        }
        console.log(totalInc);
    };

    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }

    const Income=function(id, description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    
    const data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        net:0,
        percentage:-1
    };

    const calcTotal=(type)=>{
        let sum=0;
        data.allItems[type].forEach(el=>{
            sum+=el.value;
        });
        data.totals[type]=sum;
    };

    //public
    return{
        addItem:(type,desc,val)=>{
            //[1 2 3 4 6],next id=7
            
            //create new id
            let id=1;
            const arr=data.allItems[type]
            if(arr.length>0){
                id=arr[arr.length-1].id+1;
            }

            //create new item based on inc or exp type
            let newItem;
            if(type==='exp'){
                newItem= new Expense(id,desc,val);
                //newItem.calcPercentage(date.totalInc);
            } else{
                newItem= new Income(id,desc,val);  
            }

            //push it into data struc
            data.allItems[type].push(newItem);
            return newItem;
        },
        removeItem:(type,id)=>{
            data.allItems[type]=data.allItems[type].filter(el=>el.id!==+id);
            console.log(data.allItems[type]);
        },
        calcBudget:()=>{
            //calc total income and expenses
            calcTotal('exp');
            calcTotal('inc');

            //calc net income
            data.net=data.totals.inc-data.totals.exp;
            if(data.totals.inc>0){
                //calc total exp as % of total income
                data.percentage=Math.round(data.totals.exp/data.totals.inc*100);
            }else{
                data.percentage=-1;
            }
        },
        calcExpPercents:()=>{
            const totalInc=data.totals.inc;
            data.allItems.exp.forEach(el=>el.calcPercentage(totalInc));
            

        },
        getBudget:()=>{
            return{
                budget: data.net,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            }
        },
        getExpPercents:()=>{
            return data.allItems.exp.map(el=>el.getPercentage());//return an array of %
        },
        
        //for testing
        testFunc:()=>{
            console.log(data);
        }

    }

})();



//UI Contorller
// user interface
const UIController=(function(){
    const DOMstr={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        addBtn:'.add__btn',
        expensesContainer:'.expenses__list',
        incomeContainer:'.income__list',
        netIncomeLabel:'.budget__value',
        totalIncLabel:'.budget__income--value',
        totalExpLabel:'.budget__expenses--value',
        percentageExpLabel:'.budget__expenses--percentage',
        container:'.container',
        expPercLabel:'.item__percentage',
        budgetMonth:'.budget__title--month'
    };

const formatNumber=(num,type)=>{
        /*
        + or - before number
        exactly 2 dp
        comma separating thousands
         */
        
        let sign;
        num=Math.abs(num);
        //   exactly 2 dp
        num=num.toFixed(2);//num converted a string
        const numSplit=num.split('.');
        let int=numSplit[0];
        const dec=numSplit[1];

        //  comma separating thousands
        if(int.length>3){
            let intStrRev='';
            let intStr='';
            let count=0;
            console.log(int);//test
            for(let i=int.length-1;i>=0;i--){
                if(count===3){
                    intStrRev=intStrRev.concat(',');
                    count=0;
                }
                intStrRev=intStrRev.concat(int[i]);
                count++;
    
            }
            for(let i=intStrRev.length-1;i>=0;i--){
                intStr=intStr.concat(intStrRev[i]);
            }
            int=intStr;
            console.log(int);//test
        }

        //+ or - before number
        sign= type==='exp'? '-':'+';
        return `${sign} ${int}.${dec}`;

    };

    const nodeListForEach=(nodeList,callback)=>{
        for(let i=0;i<nodeList.length;i++){
            callback(nodeList[i],i);
        }
    };

    //public object
    return {
        // add__type, decription, value
        getInput:()=>{
            return{
                type:document.querySelector(DOMstr.inputType).value, //inc or exp
                description:document.querySelector(DOMstr.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstr.inputValue).value)
            }
        },
        getDOMstr:()=>DOMstr,

        addListItem:(newItem,type)=>{
            //create HTML str with placeholder text
            let html,newHtml,element;
            
            if(type==='inc'){
                element=DOMstr.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type==='exp'){
                element=DOMstr.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
           
            //replace the placeholder text with some actual data
            newHtml=html.replace('%id%',newItem.id);
            newHtml=newHtml.replace('%description%',newItem.description);
            newHtml=newHtml.replace('%value%',formatNumber(newItem.value,type));//formatNumber

            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        removeListItem:(itemId)=>{
            document.querySelector(`#${itemId}`).remove();

        },
        clearFields:()=>{
            const fields = document.querySelectorAll(`${DOMstr.inputDescription},${DOMstr.inputValue}`);
            const fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach(element => {
                element.value='';

            });
            fieldsArr[0].focus();
        },
        displayBudget:(budgetData)=>{
            let netSign=budgetData.budget>=0? 'inc':'exp'
            document.querySelector(DOMstr.netIncomeLabel).textContent=formatNumber(budgetData.budget,netSign);
            document.querySelector(DOMstr.totalIncLabel).textContent=formatNumber (budgetData.totalInc,'inc');
            document.querySelector(DOMstr.totalExpLabel).textContent=formatNumber(budgetData.totalExp,'exp');
            if(budgetData.percentage>0){  
                document.querySelector(DOMstr.percentageExpLabel).textContent=budgetData.percentage+'%';
            }else{
                document.querySelector(DOMstr.percentageExpLabel).textContent='---';
            }
        },
        displayPercents:(expPercents)=>{
            const fields=document.querySelectorAll(DOMstr.expPercLabel);
            
            

            
            nodeListForEach(fields,(el,index)=>{
                if(expPercents[index]>0){
                    el.textContent=expPercents[index]+'%';
                }else{
                    el.textContent='---'
                }
            });
            // const fieldsArr=Array.prototype.slice.call(fields);
            // fieldsArr.forEach((el,index)=>{el.textContent=expPercents[index]});
        },
        displayMonth:()=>{
            const now= new Date();
            const year=now.getFullYear();
            const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
            const month=now.getMonth();
            
            document.querySelector(DOMstr.budgetMonth).textContent=`${monthNames[month-1]} ${year}`;
        },
        changeStyle:()=>{
            //if (event.target.value==='exp'){
                const fields=document.querySelectorAll(`${DOMstr.inputType},${DOMstr.inputValue},${DOMstr.inputDescription}`);
                nodeListForEach(fields,(curr)=>{
                    curr.classList.toggle('red-focus');
                });
                document.querySelector(DOMstr.addBtn).classList.toggle('red');
            //}

        }
    }
})();



// for UIController to interact with budgetcontroller
//global app controller
const appController=(function(budgetCtrl,UICtrl){
    

    //setup event listeners
    const setupEventListeners=()=>{
        //get DOMstring
        const DOMstr=UICtrl.getDOMstr();

        document.querySelector(DOMstr.addBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.key==='Enter'||event.which===13){
                ctrlAddItem();
            }  
        });
        document.querySelector(DOMstr.container).addEventListener('click',ctrlRemoveItem);
        document.querySelector(DOMstr.inputType).addEventListener('change',UICtrl.changeStyle);
    };

    //update budget 
    const updateBudget=()=>{
        //calculate budget
        budgetCtrl.calcBudget();

        //return budget
        const budget=budgetCtrl.getBudget();

        //display new budget on UI
        UICtrl.displayBudget(budget);
    };

    //update exp percentage
    const updateExpPercents=()=>{
        //calc %
        budgetCtrl.calcExpPercents();

        //get % from budgetController
        const expPercents=budgetCtrl.getExpPercents();
        console.log(expPercents);
        //display on UI
        UICtrl.displayPercents(expPercents);
        //console.log(expPercents);
    };

    // add item function
    const ctrlAddItem=()=>{
        //get the filed input data
        const input=UICtrl.getInput();// input.type,description,value

        if(input.description!=='' && !isNaN(input.value)&& input.value>0){
            //add input to data struc in budget controller
            const newItem=budgetCtrl.addItem(input.type,input.description,input.value);
            
            //add item to UI
            UICtrl.addListItem(newItem,input.type);

            //clear fields
            UICtrl.clearFields();

            //calc and update budget
            updateBudget();

            //calc and update exp%
            updateExpPercents();
        }
    };

    const ctrlRemoveItem=(event)=>{
        // console.log(event.target);
        // console.log(event.target.parentNode);
        // console.log(event.target.parentNode.parentNode);
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);



        const itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemId);//test
        if(itemId){
            const splitId=itemId.split('-');
            const type=splitId[0];
            const id=splitId[1];
            console.log(type,id);

            //delete item from data struc in budgetController
            budgetCtrl.removeItem(type,id);
            //detete item from UI
            UICtrl.removeListItem(itemId);

            //update budget
            updateBudget();

            //calc and update exp percentages
            updateExpPercents();
        }
    }
    
    //public
    return{
        init:()=>{
            console.log('started');
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            });
            
        },

    }
    
})(budgetController,UIController);

appController.init();





