/*
  Константы коллекций
*/
const TLG_EMPTY       = "TLG_E" // Еще ничего не загружали
const TLG_WAIT        = "TLG_W" // ожидаем загрузки
const TLG_READY       = "TLG_R" // все загрузили
const EMPTY_FILTER    = "EM_F"  // фильтр для вывода всех данных
const ERROR_FILTER    = "ER_F"  // фильтр не указали. Является ошибкой

var TCache = {};

/*
  прототип модели
*/
var TObject = Backbone.Model.extend()


/*
  прототип коллекции
*/
var TListGroup = Backbone.Collection.extend({
  
  
  // Разбор данных и приведение их к одному виду
  parse : function(a , t){
    var fields = (new this.model).defaults
    return a.reduce(function(res , item){
      Object.keys(fields).map(function( i ){
        var _f = fields[i]
        switch( Object.prototype.toString.call(_f) ){
          case '[object String]' :
            item[i] = item[i]+''
          break;
          case '[object Number]' :
            item[i] = Number( item[i] )
          break;
          case '[object Boolean]' :
            item[i] = item[i] ? true : false
          break;
        }
        
      })
      res.push(item)
      return res
    },[])
  },
  
  
  // Получение всех
  All : function( callback ){
    return this.Filter( EMPTY_FILTER , callback )
  },
  
  
  // Фильтрация данных
  Filter : function( f , callback ){
    
    var self = this
    
    
    // Когда пришла коллекция, то начинем выполнять все коллбеки
    var clener_callback = function(){
      self._State = TLG_READY
      self.__stack_callback.map(function(e , i){
        
        var _c = this;
        
        if( e.f === ERROR_FILTER ){
          _c = []
        }else if( e.f === EMPTY_FILTER ){
          _c = this;
        }else{
          _c = this.where( e.f )
        }
        e.c( _c )
        delete self.__stack_callback[ i ]
      },self)
    }
    
    
    // Пока объект не загружен все складываем в стек
    var append_callback = function( f , callback ){
      if( typeof callback == 'undefined' ){
        var callback = function(){}
      }
      if( typeof f == 'undefined' ){
        var f = ERROR_FILTER
      }
      self.__stack_callback.push({
        f : f,
        c : callback
      })
    }
    
    
    // Если еще не загружали модель
    if( this._State === TLG_EMPTY ){
      
      this._State = TLG_WAIT
      
      // Убираем пока что в стек
      append_callback( f, callback )
      
      this.fetch({
        success : function( data ){
          console.log(data , "DATA")
          clener_callback()
        },
        error : function(e,f){
          console.log(e,f)
          console.log("ERRORDATA")
          clener_callback()
        }
      })
      
    }else if( this._State === TLG_WAIT ){
      append_callback( f, callback )
    }else if( this._State === TLG_READY ){
      return callback( this.where( f ) )
    }
    
    
    return this
  },
  
  
  // Первое значение
  First : function( f , callback ){
    return this.Filter( f , function( res ){
      if( res.length ){
        callback( res[0] )
      }else{
        callback( null )
      }
    })
  }
  
})




/*
  Кеширование коллекции
*/
var gCollection = function( s ){
  var a;
  if( typeof s.url != 'undefined' ){
    if( typeof TCache[s.url] != 'undefined'  ){
      return TCache[s.url];
    }
    a = TListGroup.extend( s )
  }
  
  s._State = TLG_EMPTY
  s.__stack_callback = []
  
  a = TListGroup.extend( s )
  
  TCache[s.url] = new a
  return TCache[s.url]
}


var gModel = function( ident , s ){
  var a;
  if( typeof ident != 'undefined' ){
    if( typeof TCache[ident] != 'undefined'  ){
      return TCache[ident];
    }
    a = TObject.extend( s )
  }
  
  s.UID = new Date().getTime()
  s._State = TLG_EMPTY
  s.__stack_callback = []
  
  a = TObject.extend( s )
  
  
  TCache[ident] = a
  return TCache[ident]
}













// TESTS




var URL = 'http://127.0.0.1/test.html'








var test = gModel('test',{
  defaults : {
    id : 0,
    title  : true
  }
})




var c = gCollection({
  url : URL,
  model : test
})


c.add([{id : 12}])
c.add([{id : 121}])


gCollection({
  url : URL,
}).All(function( res ){
  console.log( res , "ALL" )
})


gCollection({
  url : URL,
}).Filter({ id : 12 } , function( res ){
  console.log( res )
})

gCollection({
  url : URL,
}).First({ id : 12 } , function( res ){
  console.log( res , "FIRST" )
})


gCollection({
  url : URL,
}).First({ id : 1454854 } , function( res ){
  console.log( res , "FIRST" )
})


gCollection({
  url : URL,
}).Filter({ id : 13 } , function( res ){
  console.log( res )
})


gCollection({
  url : URL,
}).Filter({ id : 14 } , function( res ){
  console.log( res )
})

gCollection({
  url : URL,
}).Filter({ id : 15 } , function( res ){
  console.log( res )
})