import React from 'react';
import TransactionCard, { TransactionCardProps } from '../common/TransactionCard';

export type { TransactionCardProps };

export default function LegacyTransactionCard(props: TransactionCardProps) {
  return <TransactionCard {...props} />;
}
