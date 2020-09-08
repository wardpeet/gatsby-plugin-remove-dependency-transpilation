import React from "react"
import { noTranspile } from "@wardpeet/async-lib"

export default function Home() {
  noTranspile().then(() => {
    console.log("done")
  })

  return <div>Hello world!</div>
}
