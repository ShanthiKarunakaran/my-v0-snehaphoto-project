import type React from "react"

export default function FilmStrip(): JSX.Element {
  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 h-full w-12 bg-zinc-900/80 border-l-4 border-r-4 border-zinc-700/60 opacity-30 z-10 hidden sm:block">
        <div className="flex flex-col justify-around h-full px-1">
          {Array.from({ length: 16 }).map((_, index) => (
            <div key={index} className="w-full h-4 bg-zinc-800/80" />
          ))}
        </div>
      </div>
      <div className="pointer-events-none fixed right-0 top-0 h-full w-12 bg-zinc-900/80 border-l-4 border-r-4 border-zinc-700/60 opacity-30 z-10 hidden sm:block">
        <div className="flex flex-col justify-around h-full px-1">
          {Array.from({ length: 16 }).map((_, index) => (
            <div key={index} className="w-full h-4 bg-zinc-800/80" />
          ))}
        </div>
      </div>
    </>
  )
}
