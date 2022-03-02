import React from 'react';
import ProviderComposer from './ProviderComposer';
import AccountProvider from './contexts/AccountContext';
export default function PebbleContextProvider({ children, props }) {
  return (
    <ProviderComposer contexts={[
      <AccountProvider />
    ]}
    >
      {children}
    </ProviderComposer>
  );
}
