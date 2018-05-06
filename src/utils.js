/**
 * Created by heweiguang on 2018/5/6.
 */

/**
 * 向前补位
 * @param string
 * @param length
 * @param pad
 * @returns {*}
 */
export const padStart = (string, length, pad) => {
    const s = String(string);

    if(!s || s.length >= length) {
        return string;
    }

    return `${Array(length - s.length + 1).join(pad)}${string}`;
};


/**
 * 根据 getTimezoneOffset() 返回的时差 转换为 格林威治时间（世界时）字符串
 * 如 北京时间（GMT+0800）getTimezoneOffset() 得到的是 -480min 也就是 -8h 最后返回 '+0800'
 * @param negHour
 * @returns {*}
 */
export const padZoneStr = (negHour) => {
    const hour = negHour * -1; // 负代表东区，东区对应的是 +，所以需要先转为正数

    let replacer = hour > -10 && hour < 10 ? '$10$200' : '$1$200'; // 小于 10 要在后面补 0

    return padStart(String(hour).replace(/^(.)?(\d)/, replacer), 5, '+');
};

/**
 * 是否数字（根据 Node 社区的 DRY 文化，此处应该依赖一个现有的 npm 包）
 * @param n
 * @returns {boolean}
 */
export const isNumber = n => (!Number.isNaN(parseFloat(n))) && Number.isFinite(n);

/**
 * 相差月数，参数都是 DayJs 对象和 DayJs 耦合，我觉得不应该放在 utils 里面
 * @param a
 * @param b
 * @returns {number}
 */
export const monthDiff = (a, b) => {
    const wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
          anchor = a.clone().add(wholeMonthDiff, 'months');

    let anchor2,
        adjust;

    if(b - anchor < 0) {
        anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
        adjust = (b - anchor) / (anchor - anchor2);
    }else {
        anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
        adjust = (b - anchor) / (anchor2 - anchor);
    }

    return Number(-(wholeMonthDiff + adjust));
};

export const absFloor = n => (n < 0 ? Math.ceil(n) || 0 : Math.floor(n));

/**
 * expect(prettyUnit('Days')).toBe('day')
 * expect(prettyUnit('days')).toBe('day')
 * expect(prettyUnit('day')).toBe('day')
 * expect(prettyUnit()).toBe(undefined)
 * @param u
 * @returns {*|string}
 */
export const prettyUnit = u => (u && String(u).toLowerCase().replace(/s$/, ''));

export const isUndefined = s => s === undefined;
