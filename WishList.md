# Must



# Better



# Wish

## デイリーレポートの数値を桁揃えしたい

- メモ

```javascript
var showSpace = function() {
  var num = 1;
  Logger.log('【\u0020%s】', num);
  Logger.log('【%s\u0020】', num);

  num = String(1);
  Logger.log('【\u0020%s】', num);
  Logger.log('【%s\u0020】', num);
}
```
