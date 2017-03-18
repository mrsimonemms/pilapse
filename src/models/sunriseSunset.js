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
        column: 'civil_twilight_begin'
      },

      sunset: {
        type: 'date',
        value: moment().set({
          hour: 22,
          minute: 0,
          second: 0,
          millisecond: 0
        }).toDate(),
        column: 'civil_twilight_end'
      },

      updated: {
        type: 'date'
      }

    };
  }

  /**
   * Is Daylight
   *
   * Calculates if the given times are in the daylight.
   * As the data may not be valid today (ie, if the data
   * hasn't been updated), we just look between the times
   * not the date.
   *
   * @returns {boolean}
   */
  isDaylight () {
    const times = {
      sunrise: this.get('sunrise'),
      sunset: this.get('sunset')
    };

    const today = new Date();
    const now = today.getTime();

    /* Ensure that the date is today's date */
    for (const key in times) {
      times[key].setFullYear(today.getFullYear());
      times[key].setMonth(today.getMonth());
      times[key].setDate(today.getDate());
    }

    return times.sunrise.getTime() <= now && times.sunset.getTime() >= now;
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
