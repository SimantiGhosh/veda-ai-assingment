import express from 'express'
import { env } from './config'
const app = express()
const port = env.PORT

app.get('/', (req, res) => {
	res.json({ status: 'ok' })
})

app.listen(port, () => {
	console.log(`Server listening on port :${port}`)
})

export { app }
