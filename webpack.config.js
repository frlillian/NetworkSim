module.exports = {   
  devServer: {     
     watchOptions: {
        ignored: [ path.resolve(__dirname, 'dist'),         
                   path.resolve(__dirname, 'node_modules'),         
                   path.resolve(__dirname, 'public') // image folder path 
                  ]    
  }},}