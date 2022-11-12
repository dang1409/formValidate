function validator(options, onSubmit) {
    var formRules = {}
    var formElement = document.querySelector(options)
    

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    function getValueConfirm() {
        var formElement = document.querySelector(options)
        return formElement.querySelector('input[type="password"]').value
    }

   
    var ValidateRules = {
        require: function(value) {
            return value ? undefined : 'Vui lòng nhập vào trường này'
        },

        email:function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined:"Vui lòng nhập đúng định dạng email"
        },

        confirm: function(value) {
            return value === getValueConfirm() ? undefined: 'Mật khẩu không trùng khớp'
        },

        min: function(min) {
            return  function(value) {
                return value.length >= min ? undefined:`Nhập tối thiểu ${min} kí tự`;
            }
        },  

        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined:`Nhập tối thiểu ${max} kí tự`
            }
        }
    }

    if(formElement) {
        var inputs = formElement.querySelectorAll("[name][rule]")
        var ruleInfo 
        

        for(var input of inputs) {
            var rules = input.getAttribute("rule").split("|")
            
            for(var rule of rules) {
                var ruleHasValue = rule.includes(':')

                if(ruleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = ValidateRules[rule]
            
            if(ruleHasValue) {
               ruleFunc =  ruleFunc(ruleInfo[1])
            }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                }
                else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            input.onblur = handleValidate
            input.oninput = handleClearError
        }

        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage 

            for(var rule of rules) {
                switch (event.target.type) {
                    case 'checkbox':
                    case 'radio':
                        errorMessage = rule(event.target.checked)
                        break;
                    default:   
                        errorMessage = rule(event.target.value);
                }

                if(errorMessage) break;
            }

            if(errorMessage) {
                formGroup = getParent(event.target, '.form-group')

                if(formGroup) {
                    formMessage = formGroup.querySelector('.form-message')
                    if(formMessage) {
                        formMessage.innerText = errorMessage
                        formGroup.classList.add('invalid')
                    }
                }
            }

            return !errorMessage
        }

        function handleClearError(event) {
            var formGroup = getParent(event.target,'.form-group')
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                
                var formMessage = formGroup.querySelector('.form-message')
                if(formMessage) {
                    formMessage.innerText = ''
                }
            }
        }

     
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var inputs = formElement.querySelectorAll("[name][rule]")
            var isValid = true

            for(var input of inputs) {
                if(!handleValidate({target: input})) {
                    isValid = false 
                }
                handleValidate({target: input})
            }

            if(isValid) {
                if(typeof onSubmit === 'function') {

                    var inputs = formElement.querySelectorAll("[name][rule]")
                    var formData = Array.from(inputs).reduce(function(values, input) {

                        switch(input.type) {
                            
                            case 'radio':
                                // values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                if(input.checked) {
                                    values[input.name] = input.value;
                                }
                                break;

                            case 'checkbox':

                                if(input.checked) {
                                    console.log(input.value)
                                    if(Array.isArray(values[input.name])) {
                                        values[input.name].push(input.value)
                                    }
                                    else {
                                    values[input.name] = [input.value]
                                    }
                                }
                                if(!values[input.name]) {
                                    values[input.name] = ''
                                }

                                break;

                                
                            case 'file':
                                values[input.name] = input.value
                                break;
                            default:
                                values[input.name] = input.value

                        }

                        return values
                    }, {})
                    console.log(formData)
                }
            }
        }
    }
    
}