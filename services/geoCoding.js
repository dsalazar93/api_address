const axios = require('axios')

const services = {}

services.google = (address) => {
  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.API_KEY_GOOGLE}`).then((response) => {
    return response
  }).catch((err) => {
    console.log(err)
  })
}

services.here = (address) => {
  return axios.get(`https://geocode.search.hereapi.com/v1/geocode?q=${address}&apiKey=${process.env.API_KEY_HERE}`).then((response) => {
    return response
  }).catch((err) => {
    console.log(err)
  })
}

module.exports = services