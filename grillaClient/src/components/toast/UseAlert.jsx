import React, { useState } from "react"
import Alert from "./Alert"

export default function UseAlert() {
  const [list, setAlerts] = useState([])

  const createToast = options => {
    setAlerts([...list, options])
    setTimeout(() => {
      setAlerts(l => l.slice(1))
    }, 3000)
  }

  const alerts = (
    <div className="fixed right-0">
      {list.map((t, i) => (
        <Alert key={i} type={t.type} icon={t.icon}>{t.text}</Alert>
      ))}
    </div>
  )

  return {
    alerts,
    createToast
  }
}