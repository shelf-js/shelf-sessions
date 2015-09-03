import Model from '../lib'

let TestModel = new Model({prefix: 'test'})

TestModel.extend({
  name: 'This_Is_A_Model',
  props: {
    a: 'String',
    b: 'Number'
  },
  keys: ['a']
})

let myModel = new TestModel({a: 'yolo', b: 3})

myModel.save()
