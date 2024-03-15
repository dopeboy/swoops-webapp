import React, { Component } from "react";

import { Crisp } from "crisp-sdk-web";

class CrispChat extends Component {
  componentDidMount () {
    Crisp.configure("1fe75dec-c761-4983-bdcd-dba262db43f4");
  }

  render () {
    return null;
  }
}
export default CrispChat