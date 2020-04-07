/** 
 * @author SARFO PHILIP
 *
 * App Utilities
 */
const AdminModel = require('../model/admin').adminModel
const bcrypt = require('../util/bcrypt')

module.exports = {
    /**
     * Method returns a value when predicate matches the immediate value and
     * returns null when it does not match any
     * @param {Array} array 
     * @param {boolean} predicate 
     */
    find: function (array, predicate) {

        for (value of array) {
            const test = predicate(value)
            if (test) {
                return value;
            }
        }
        return null;
    },
    /**
     * Method returns a promise when a predicate matches
     * @param {array} array 
     * @param {function} predicate 
     */
    perform: async function (array, predicate) {
        for (value of array) {
            const test = predicate(value)
            if (test) {
                return Promise.resolve(value)
            }
        }
        return Promise.reject(null)
    },
    populateAdmin: function (onComplete) {
        let admin = new AdminModel({ fullname: 'Super Admin', email: 'super@social.com', password: bcrypt.encodeSync('super') })
        AdminModel.exists({ email: admin.email })
            .then(res => {
                if (res) {
                    onComplete(`admin Already available ${Date.now()}`)
                } else {
                    admin.save()
                    onComplete(`admin created - ${Date.now()}`)
                }
            }).catch(err => onComplete(`admin failed to create`))
    },
    /**
     * Method returns the number of values removed from the array
     * @param {Array} array 
     * @param {function} predicate 
     */
    remove: function (array, predicate) {
        let processedArray = []
        for (index in array) {
            const test = predicate(array[index])
            if (!test) {
                processedArray.push(array[index])
            }
        }
        return processedArray;
    },
    flatMap: function (array, functor) {
        let newMap = [];
        for (arr of array) {
            const result = functor(arr)
            newMap.push(result)
            //newMap.push(arr);
        }
        return newMap;
    },
    findAbsPath: (path) => {
        path = path.substring(1)
        let pathArray = path.split('')
        let result = '';      
        for(let i = 0; i < pathArray.length; i++){
            if(pathArray[i] == '/') break;

            result += pathArray[i]
        }

        return result;
    }
}