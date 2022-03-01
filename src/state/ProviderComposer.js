import React from 'react';

export default function ProviderComposer({ contexts, children }) {
  return contexts.reduceRight(
    (kids, parent) => React.cloneElement(parent, {
      children: kids,
    }),
    children
  )
}
