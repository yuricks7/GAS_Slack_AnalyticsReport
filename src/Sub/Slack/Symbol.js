class SlackSymbol {

  constructor() {
    this.lf   = '\n';
    this.bold = '*';

    const CODE_BLOCK = '```';
    this.codeBlock   = `${CODE_BLOCK}${this.lf}`
    this.myDelimiter = ' || ';

    this.quote = '>';

    this.error = '■■';
    this.rankIcons = [
      ':one:', ':two:',   ':three:', ':four:', ':five:',
      ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'
    ];

  }
}
