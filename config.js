const config = {
  "scene": [
    {
      "index" : 0, 
      "name" : "睡房",
      "image" : "bedroom.jpg",
      "start_theta" : 40.0,
      "anchor" : [
        {
          "name" : "客廳",
          "theta" : -120,
          "phi" : 4,
          "direction" : "LEFT",
          "target" : 1,
        },
        {
          "name" : "衣櫃",
          "theta" : -33,
          "phi" : 8,
          "direction" : "RIGHT",
          "target" : 1,
        }
      ]
    },
    {
      "index" : 1, 
      "name" : "客廳",
      "image" : "diningroom.jpg",
      "start_theta" : 180.0,
      "anchor" : [
        {
          "name" : "睡房",
          "theta" : 103,
          "phi" : -7.5,
          "direction" : "LEFT",
          "target" : 0,
        }
      ]
    }
  ]
}

export { config }