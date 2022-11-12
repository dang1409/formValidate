function validator(options) {
    const formElement = document.querySelector(options.form)

    // Dùng để lấy thẻ cha của inputElement
    var getParent = function(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element= element.parentElement
        }
    }

    //Khởi tạo 1 object lưu trữ các rules
    var selectorRules = {}

    // Hàm thực hiẹn thay đổi 
    const validate = function(inputElement,rule) {
        const errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message')
        var errorMessage;

        //lấy ra tất cả các rules của selector
        var rules =  selectorRules[rule.selector]

        //Lặp qua từng rule và kiểm tra
        //Nếu có lỗi thì thoát khỏi vòng lặp
        for(var i = 0; i < rules.length; ++i) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            
            if(errorMessage) break;
        }

            if(errorMessage) {
                errorElement.innerHTML = errorMessage
                getParent(inputElement, options.formGroupSelector).classList.add('invalid')
            }
            else {
                errorElement.innerHTML = ''
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            }

        return !!errorMessage
        
    }
    // khai báo các biến
    if(formElement) {

        // Xử lý khi ấn submit
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true

            //lặp qua từng rule và validate
            options.rules.forEach(function(rule) {
                const inputElement = formElement.querySelector(rule.selector)
                var isInValid = validate(inputElement,rule)
                if(isInValid) {
                    isFormValid = false
                }
            })

            
            if(isFormValid) {
                //submit vs js
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    var formValues = Array.from(enableInputs).reduce(function(values,input) {

                        switch (input.type) {
                            case 'checkbox':

                                if(input.checked){
                                    if(Array.isArray(values[input.name])){
                                        values[input.name].push(input.value)
                                    } else {
                                        values[input.name] = [input.value] 
                                    }
                                } 
                                if(!values[input.name]){
                                    values[input.name] = ''
                                }
                                break;

                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        
                        return values;
                    }, {})
                    options.onSubmit(formValues)
                }
                else {
                    formElement.submit();
                }          
            }
        }

        //Lặp qua mỗi rule và xử lý
        options.rules.forEach(function(rule) {
            const inputElements = formElement.querySelectorAll(rule.selector)
             
                //Lưu lại các rules cho mỗi input
                if(Array.isArray(selectorRules[rule.selector])) {
                    selectorRules[rule.selector].push(rule.test)
                }   
                else {
                    selectorRules[rule.selector] = [rule.test]
                }

            Array.from(inputElements).forEach(function(inputElement) {

                if(inputElement) {
                    // đọc thay đổi sự kiện
                    inputElement.onblur = function() {
                        validate(inputElement,rule)
                    }
                    //Xử lý khi người dùng nhập vào input
                    inputElement.oninput = function() {
                        const errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message')
                        errorElement.innerHTML = ''
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }
                }
            })
        })
    }
}
validator.isRequired = function(selector) {
    return {
        selector:selector,
        test: function(value) {
            return value ? undefined:'Vui lòng nhập vào dòng này'
        }
    }
}

validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined:'Vui lòng nhập đúng định dạng mail'
        }
    }
}

validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

validator.isConfirm = function(selector, getConfirmValue) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined:'Kết quả nhập không chính xác'
        }
    }
}