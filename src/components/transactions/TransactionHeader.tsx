import React from "react";
import Header, { HeaderProps } from "../common/Header";

export type TransactionHeaderProps = HeaderProps;

export default function TransactionHeader(props: TransactionHeaderProps) {
  return <Header {...props} />;
}
