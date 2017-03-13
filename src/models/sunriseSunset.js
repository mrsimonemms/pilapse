/**
 * sunriseSunset
 */

/* Node modules */

/* Third-party modules */
const { Model } = require('@steeplejack/data');
const moment = require('moment');

/* Files */

module.exports = class SunriseSunset extends Model {
  _schema () {
    return {

      sunrise: {
        type: 'date',
        value: moment().set({
          hour: 4,
          minute: 0,
          second: 0,
          millisecond: 0
        }).toDate(),
        column: 'nautical_twilight_begin'
      },

      sunset: {
        type: 'date',
        value: moment().set({
          hour: 22,
          minute: 0,
          second: 0,
          millisecond: 0
        }).toDate(),
        column: 'nautical_twilight_end'
      },

      updated: {
        type: 'date'
      }

    };
  }

  /**
   * Is Updated Today
   *
   * Has this been updated today?
   *
   * @returns {boolean}
   */
  isUpdatedToday () {
    if (this.get('updated')) {
      return moment(this.get('updated')).isSame(new Date(), 'day');
    }

    return false;
  }
};
