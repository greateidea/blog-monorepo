type Dict<T = any> = {
  [key: string]: T;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "micro-app": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          name: string;
          url: string;
          params?: Record<string, string>;
          iframe?: boolean;
          destroy?: boolean;
        },
        HTMLElement
      >;
    }
  }
}
