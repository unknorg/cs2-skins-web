import {ReactNode} from "react";


interface HorizontalScrollProps {
  elements: [string, ReactNode][],
  onSelect: (elementId: string) => void
}

export default function HorizontalScroll(props: HorizontalScrollProps) {

  return (
      <div className="relative w-full h-full flex-grow">
        <div className="absolute left-0 right-0 top-0 bottom-0 overflow-y-auto flex">
          {props.elements.map(p => (
              <div className="h-full aspect-square cursor-pointer"
                   onClick={() => props.onSelect(p[0])}
                   key={p[0]}>
                {p[1]}
              </div>
          ))}
        </div>
      </div>
  )
}