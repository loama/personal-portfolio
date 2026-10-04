export function ButtonLabel({ children }: { children: string }) {
  return <span className="button-label">
    <span className="button-label-rest">{children}</span>
    <span aria-hidden="true" className="button-label-hover">{children}</span>
  </span>;
}
