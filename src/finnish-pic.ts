'use strict'
/**
 * Project: finnish-pic
 * Purpose: Validate and generate Finnish PICs according to https://fi.wikipedia.org/wiki/Henkil%C3%B6tunnus
 * Author:  Sampo Reponen
 * Author:  Ville Komulainen
 */

interface PIC {
  valid: boolean
  sex: string
  ageInYears: number
  dateOfBirth: Date
}

export class FinnishPic {
  public static FEMALE = 'female'
  public static MALE = 'male'

  /**
   * Parse a given PIC string into Object representation.
   * @param pic - {String} PIC to parse
   */
  public static parse(pic: string): PIC {
    //  Sanity and format check, which allows to make safe assumptions on the format.
    if (!PIC_REGEX.test(pic)) {
      throw new Error('Not valid PIC format')
    }

    const dayOfMonth = parseInt(pic.substring(0, 2), 10)
    const month = pic.substring(2, 4)
    const centuryId = pic.charAt(6)
    // tslint:disable-next-line:no-non-null-assertion
    const year = parseInt(pic.substring(4, 6), 10) + centuryMap.get(centuryId)!
    const rollingId = pic.substring(7, 10)
    const checksum = pic.substring(10, 11)
    const sex = parseInt(rollingId, 10) % 2 ? this.MALE : this.FEMALE
    const daysInMonth = daysInGivenMonth(year, month)

    if (!daysInMonthMap.get(month) || dayOfMonth > daysInMonth) {
      throw new Error('Not valid PIC')
    }

    const checksumBase = parseInt(pic.substring(0, 6) + rollingId, 10)
    const dateOfBirth = new Date(year, parseInt(month, 10) - 1, dayOfMonth, 0, 0, 0, 0)
    const today = new Date()

    return {
      valid: checksum === checksumTable[checksumBase % 31],
      sex,
      dateOfBirth,
      ageInYears: ageInYears(dateOfBirth, today)
    }
  }

  /**
   * Validates a given PIC. Returns true if PIC is valid, otherwise false.
   * @param pic - {String} For example '010190-123A'
   */
  public static validate(pic: string): boolean {
    try {
      return this.parse(pic).valid
    } catch (error) {
      return false
    }
  }

  /**
   * Generates a valid PIC using the given age (Integer). Creates randomly male and female PICs.
   * In case an invalid age is given, throws an exception.
   *
   * @param age as Integer. Min valid age is 1, max valid age is 200
   */
  public static generateWithAge(age: number): string {
    if (age < MIN_AGE || age > MAX_AGE) {
      throw new Error(`Given age (${age}) is not between sensible age range of ${MIN_AGE} and ${MAX_AGE}`)
    }
    const today = new Date()
    let year = today.getFullYear() - age
    const month = randomMonth()
    const dayOfMonth = randomDay(year, month)
    const rollingId = randomNumber(800) + 99 //  No need for padding when rollingId >= 100
    const birthCentury = Math.floor(year / 100) * 100
    const validCenturySigns = centuryIdMap.get(birthCentury) || '-'
    const centurySign = validCenturySigns.charAt(Math.floor(Math.random() * validCenturySigns.length))

    if (!birthDayPassed(new Date(year, Number(month) - 1, Number(dayOfMonth)), today)) {
      year--
    }
    year = year % 100
    const yearString = yearToPaddedString(year)
    const checksumBase = parseInt(dayOfMonth + month + yearString + rollingId, 10)
    const checksum = checksumTable[checksumBase % 31]

    return dayOfMonth + month + yearString + centurySign + rollingId + checksum
  }

  public static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }
}

const centuryMap: Map<string, number> = new Map()
centuryMap.set('A', 2000)
centuryMap.set('B', 2000)
centuryMap.set('C', 2000)
centuryMap.set('D', 2000)
centuryMap.set('E', 2000)
centuryMap.set('F', 2000)
centuryMap.set('-', 1900)
centuryMap.set('Y', 1900)
centuryMap.set('X', 1900)
centuryMap.set('W', 1900)
centuryMap.set('V', 1900)
centuryMap.set('U', 1900)
centuryMap.set('+', 1800)

const centuryIdMap: Map<number, string> = new Map()
centuryIdMap.set(1800, '+')
centuryIdMap.set(1900, 'YXWVU-')
centuryIdMap.set(2000, 'ABCDEF')

const february = '02'
const daysInMonthMap: Map<string, number> = new Map()
daysInMonthMap.set('01', 31)
daysInMonthMap.set('02', 28)
daysInMonthMap.set('03', 31)
daysInMonthMap.set('04', 30)
daysInMonthMap.set('05', 31)
daysInMonthMap.set('06', 30)
daysInMonthMap.set('07', 31)
daysInMonthMap.set('08', 31)
daysInMonthMap.set('09', 30)
daysInMonthMap.set('10', 31)
daysInMonthMap.set('11', 30)
daysInMonthMap.set('12', 31)

const checksumTable: string[] = '0123456789ABCDEFHJKLMNPRSTUVWXY'.split('')

const MIN_AGE = 1
const MAX_AGE = 200
const PIC_REGEX = /^(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])([5-9]\d\+|\d\d[-YXWVU]|[012]\d[ABCDEF])\d{3}[\dA-Z]$/

function randomMonth(): string {
  return `00${randomNumber(12)}`.substr(-2, 2)
}

function yearToPaddedString(year: number): string {
  return year % 100 < 10 ? `0${year}` : year.toString()
}

function randomDay(year: number, month: string): string {
  const maxDaysInMonth = daysInGivenMonth(year, month)

  return `00${randomNumber(maxDaysInMonth)}`.substr(-2, 2)
}

function daysInGivenMonth(year: number, month: string) {
  // tslint:disable-next-line:no-non-null-assertion
  const daysInMonth = daysInMonthMap.get(month)!

  return month === february && FinnishPic.isLeapYear(year) ? daysInMonth + 1 : daysInMonth
}

function randomNumber(max: number): number {
  return Math.floor(Math.random() * max) + 1 // no zero
}

function ageInYears(dateOfBirth: Date, today: Date): number {
  return today.getFullYear() - dateOfBirth.getFullYear() - (birthDayPassed(dateOfBirth, today) ? 0 : 1)
}

function birthDayPassed(dateOfBirth: Date, today: Date): boolean {
  return (
    dateOfBirth.getMonth() < today.getMonth() ||
    (dateOfBirth.getMonth() === today.getMonth() && dateOfBirth.getDate() <= today.getDate())
  )
}
