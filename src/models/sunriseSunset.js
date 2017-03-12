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
      },

      sunset: {
        type: 'date',
      },

      noon: {
        type: 'date',
        column: 'solar_noon',
      },

      dayLength: {
        type: 'integer',
        column: 'day_length',
      },

      civilTwighlightBegin: {
        type: 'date',
        column: 'civil_twilight_begin',
      },

      civilTwighlightEnd: {
        type: 'date',
        column: 'civil_twilight_end',
      },

      nauticalTwighlightBegin: {
        type: 'date',
        column: 'nautical_twilight_begin',
      },

      nauticalTwighlightEnd: {
        type: 'date',
        column: 'nautical_twilight_end',
      },

      astronomicalTwilightBegin: {
        type: 'date',
        column: 'astronomical_twilight_begin',
      },

      astronomicalTwilightEnd: {
        type: 'date',
        column: 'astronomical_twilight_end',
      },

      updated: {
        type: 'date'
      },

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
