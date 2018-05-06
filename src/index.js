/**
 * Created by heweiguang on 2018/5/6.
 */

import {
    SECONDS_A_MINUTE,
    SECONDS_A_HOUR,
    SECONDS_A_DAY,
    SECONDS_A_WEEK,
    MILLISECONDS_A_SECOND,
    MILLISECONDS_A_MINUTE,
    MILLISECONDS_A_HOUR,
    MILLISECONDS_A_DAY,
    MILLISECONDS_A_WEEK,
    MS,
    S,
    MIN,
    H,
    D,
    W,
    M,
    Q,
    Y,
    DATE,
    WEEKS,
    MONTHS,
    FORMAT_DEFAULT,
    REGEX_PARSE,
    REGEX_FORMAT
} from './constant';

import {
    padStart,
    padZoneStr,
    isNumber,
    monthDiff,
    absFloor,
    prettyUnit,
    isUndefined
} from "./utils";

const parseConfig = (config) => {
    if(config === null) {
        return new Date(NaN); // 返回 Invalid Date
    }

    if(isUndefined(config)) {
        return new Date();
    }

    if(config instanceof Date) {
        return config;
    }

    // 返回例如 [ '2018-05-06', '2018', '05', '06', index: 0, input: '2018-05-06' ] or null
    const reg = String(config).match(REGEX_PARSE);

    if(reg) {
        return new Date(reg[1], reg[2] - 1, reg[3]);
    }

    return new Date(config); // timestamp
};

class DayJs {
    constructor(config) {
        this.$d = parseConfig(config);
        this.init();
    }

    init() {
        this.$zone = this.$d.getTimezoneOffset() / 60; // 北京时间 -480 / 60
        this.$zoneStr = padZoneStr(this.$zone); // '+0800'
        this.$y = this.$d.getFullYear();
        this.$M = this.$d.getMonth();
        this.$D = this.$d.getDate();
        this.$W = this.$d.getDay(); // 这个命名其实有点迷
        this.$H = this.$d.getHours();
        this.$m = this.$d.getMinutes();
        this.$s = this.$d.getSeconds();
        this.$ms = this.$d.getMilliseconds();
    }

    /**
     * 是否合法的日期
     * @returns {boolean}
     */
    isValid() {
        return !(this.$d.toString() === 'Invalid Date');
    }

    /**
     * 是否闰年
     * @returns {boolean}
     */
    isLeapYear() {
        return ((this.$y % 4 === 0) && (this.$y % 100 !== 0)) || (this.$y % 400 === 0);
    }

    valueOf() {
        return this.$d.getTime();
    }

    /**
     * 是否相等
     * @param that
     * @returns {boolean}
     */
    isSame(that) {
        return this.valueOf() === that.valueOf();
    }

    /**
     * 是否更早
     * @param that
     * @returns {boolean}
     */
    isBefore(that) {
        return this.valueOf() < that.valueOf();
    }

    /**
     * 是否更晚
     * @param that
     * @returns {boolean}
     */
    isAfter(that) {
        return this.valueOf() > that.valueOf();
    }

    year() {
        return this.$y;
    }

    month() {
        return this.$M;
    }

    day() {
        return this.$W;
    }

    date() {
        return this.$D;
    }

    hour() {
        return this.$H;
    }

    minute() {
        return this.$m;
    }

    second() {
        return this.$s;
    }

    millisecond() {
        return this.$ms;
    }

    /**
     * unix 时间戳
     * @returns {number}
     */
    unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    /**
     * 复制，为了使数据不可变 (Immutable)
     * @returns {DayJs}
     */
    clone() {
        return new DayJs(this);
    }

    /**
     * 设置为开始 or 结束时间
     * ref: https://momentjs.com/docs/#/manipulating/start-of/
     * @param units
     * @param startOf
     * @returns {*}
     */
    startOf(units, startOf) {
        const isStartOf = !isUndefined(startOf) ? startOf : true;
        const unit = prettyUnit(units);

        const instanceFactory = (d, m, y = this.$y) => {
            const ins = new DayJs(new Date(y, m, d));
            return isStartOf ? ins : this.endOf(D);
        };

        const instanceFactorySet = (method, slice) => {
            const argumentStart = [0, 0, 0, 0],
                  argumentEnd = [23, 59, 59, 999]; // 对应 时，分，秒，毫秒

            const date = this.toDate();

            return new DayJs(date[method].apply(date, isStartOf ? argumentStart.slice(slice) : argumentEnd.slice(slice)));
        };

        switch(unit) {
            case Y:
                return isStartOf ? instanceFactory(1, 0) : // 1 月 1日
                    instanceFactory(31, 11); // 12 月 31 日
            case M:
                return isStartOF ? instanceFactory(1, this.$M) : // 1 日
                    instanceFactory(0, this.$M + 1); // 下个月的前一天 就是这个月的最后一天
            case W: // 这周第一天 or 最后一天
                return isStartOf ? instanceFactory(this.$D - this.$W, this.$M) :
                    instanceFactory(this.$D + (6 - this.$W), this.$M);
            case D:
            case DATE:
                return instanceFactorySet('setHours', 0);
            case H:
                return instanceFactorySet('setMinutes', 1);
            case MIN:
                return instanceFactorySet('setSeconds', 2);
            case S:
                return instanceFactorySet('setMilliseconds', 3);
            default:
                return this.clone();
        }
    }

    endOf(units) {
        return this.startOf(units, false);
    }

    /**
     * setter
     * @param units
     * @param int
     * @returns {DayJs}
     */
    mSet(units, int) {
        const unit = prettyUnit(units);

        switch(unit) {
            case DATE:
                this.$d.setDate(int);
                break;
            case M:
                this.$d.setMonth(int);
                break;
            case Y:
                this.$d.setFullYear(int);
                break;
            case H:
                this.$d.setHours(int);
                break;
            case MIN:
                this.$d.setMinutes(int);
                break;
            case S:
                this.$d.setSeconds(int);
                break;
            case MS:
                this.$d.setMilliseconds(int);
                break;
            default:
                break;
        }

        this.init();

        return this;
    }

    /**
     * setter
     * @param units
     * @param int
     * @returns {DayJs}
     */
    set(units, int) {
        if(!isNumber(int)) {
            return this;
        }

        return this.clone().mSet(units, int);
    }

    /**
     * 某月有多少天
     * @returns {*}
     */
    daysInMonth() {
        return this.endOf(M).$D;
    }

    /**
     * 增加年，月，日，时，分，秒
     * @param number
     * @param units
     * @returns {DayJs}
     */
    add(number, units) {
        const unit = (unit && unit.length === 1) ? units : prettyUnit(units);

        // 增加月（大M月 小m秒）
        if(['M', M].indexOf(unit) > -1) {
            let date = this.set(DATE, 1).set(M, this.$M + number); // 先设置成 1 号防止有些月份没有当前号
            date = date.set(DATE, Math.min(this.$D, this.daysInMonth()));

            return date;
        }

        // 增加年
        if(['y', Y].indexOf(unit) > -1) {
            return this.set(Y, this.$y + number);
        }

        let step;

        switch(unit) {
            case 'm':
            case MIN:
                step = MILLISECONDS_A_MINUTE;
                break;
            case 'h':
            case H:
                step = MILLISECONDS_A_HOUR;
                break;
            case 'd':
            case D:
                step = MILLISECONDS_A_DAY;
                break;
            case 'w':
            case W:
                step = MILLISECONDS_A_WEEK;
                break;
            default: // 剩下秒的情况（'s', 'second'）
                step = MILLISECONDS_A_SECOND;
        }

        const nextTimestamp = this.valueOf() + (number * step);

        return new DayJs(nextTimestamp);
    }

    /**
     * 减少年，月，日，时，分，秒
     * @param number
     * @param string
     * @returns {DayJs}
     */
    subtract(number, string) {
        return this.add(number * -1, string);
    }

    /**
     * 格式化
     * @param formatStr
     * @returns {string}
     */
    format(formatStr) {
        const str = formatStr || FORMAT_DEFAULT;

        return str.replace(REGEX_FORMAT, (match) => {
            switch(match) {
                case 'YY':
                    return String(this.$y).slice(-2);
                case 'YYYY':
                    return String(this.$y);
                case 'M':
                    return String(this.$M + 1);
                case 'MM':
                    return padStart(this.$M + 1, 2, '0');
                case 'MMM':
                    return MONTHS[this.$M].slice(0, 3);
                case 'MMMM':
                    return MONTHS[this.$M];
                case 'D':
                    return String(this.$D);
                case 'DD':
                    return padStart(this.$D, 2, '0');
                case 'd':
                    return String(this.$W);
                case 'dddd':
                    return WEEKS[this.$W];
                case 'H':
                    return String(this.$H);
                case 'HH':
                    return padStart(this.$H, 2, '0');
                case 'h':
                case 'hh':
                    if(this.$H === 0) {
                        return 12;
                    }

                    return padStart(this.$H < 13 ? this.$H : this.$H - 12, match === 'hh' ? 2 : 1, '0');
                case 'a':
                    return this.$H < 12 ? 'am' : 'pm';
                case 'A':
                    return this.$H < 12 ? 'AM' : 'PM';
                case 'm':
                    return String(this.$m);
                case 'mm':
                    return padStart(this.$m, 2, '0');
                case 's':
                    return String(this.$s);
                case 'ss':
                    return padStart(this.$s, 2, '0');
                case 'Z':
                    return `${this.$zoneStr.slice(0, -2)}:00`; //'+0800' => '+80'
                default: // 'ZZ'
                    return this.$zoneStr;
            }
        });
    }

    /**
     * 相差年，月，日，时，分，秒
     * @param input
     * @param units
     * @param float
     * @returns {number}
     */
    diff(input, units, float) {
        const unit = prettyUnit(units);
        const that = input instanceof DayJs ? input : new DayJs(input);
        const diff = this - that;

        let result = monthDiff(this, that);

        switch(unit) {
            case Y:
                result /= 12;
                break;
            case M:
                break;
            case Q:
                result /= 3;
                break;
            case W:
                result = diff / MILLISECONDS_A_WEEK;
                break;
            case D:
                result = diff / MILLISECONDS_A_DAY;
                break;
            case S:
                result = diff / MILLISECONDS_A_SECOND;
                break;
            default: // millisecond
                result = diff;
        }

        return float ? result : absFloor(result);
    }

    /**
     * 转为 Date 对象
     * @returns {Date}
     */
    toDate() {
        return new Date(this.$d);
    }

    toArray() {
        return [
            this.$y,
            this.$M,
            this.$D,
            this.$H,
            this.$m,
            this.$s,
            this.$ms
        ];
    }

    toJSON() {
        return this.toISOString();
    }

    toISOString() {
        return this.toDate().toISOString();
    }

    toObject() {
        return {
            years: this.$y,
            months: this.$M,
            date: this.$D,
            hours: this.$H,
            minutes: this.$m,
            seconds: this.$s,
            milliseconds: this.$sm
        }
    }
}

export default config => (new DayJs(config));
