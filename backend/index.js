import express from 'express'


const app = express()
const PORT = 8000 


app.get('/', (req, res) => {
  res.send('Hello from the social server!')
})

app.listen(PORT, () => {
  console.log(`Social server is running on http://localhost:${PORT}`)
})
