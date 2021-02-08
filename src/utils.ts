// type IfEquals<X, Y, A=X, B=never> =
//   (<T>() => T extends X ? 1 : 2) extends
//   (<T>() => T extends Y ? 1 : 2) ? A : B;

// type WritableKeys<T> = {
//   [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
// }[keyof T];

// type ReadonlyKeys<T> = {
//   [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>
// }[keyof T];

type Content = Node[] | string

const dataset = (el: HTMLElement, key: string, data: Record<string, string>) => {
  for (const rule in data) {
    (el as any)[key][rule] = data[rule]
  }
  return el
}

export function myH(tag: string, attrs: Record<string, any> = {}, content: Content = []) {
  let el = document.createElement(tag)
  for (const k in attrs) {
    if (k === 'dataset' || k === 'style') {
      el = dataset(el, k, attrs[k])
    } else {
      (el as any)[k] = attrs[k]
    }
  }

  if (content) {
    let c = Array.isArray(content) ? content : [content]
    c.forEach((e: (Node | string)) => {
      if (e) {
        el.appendChild('string' == typeof e ? document.createTextNode(e) : e)
      }
    })
  }
  return el
}
