
const DatePattern = new RegExp('^(?<year>[1-9][0-9]{3})(\-)(?<month>0?[1-9]|1[0-2])(\-)(?<day>0?[1-9]|[12][0-9]|3[01])$');
const EmailPattern = new RegExp('^[a-z0-9]+([_\.][a-z0-9]+)?@[a-z]+(\.[a-z]+)+$');

export {
    DatePattern,
    EmailPattern
};