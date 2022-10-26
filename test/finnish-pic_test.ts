'use strict'
import { FinnishPic } from '../src/finnish-pic'
import { expect } from 'chai'
import MockDate from 'mockdate'

describe('FinnishPIC', () => {
  describe('#validate', () => {
    it('Should fail when given empty String', () => {
      expect(FinnishPic.validate('')).to.equal(false)
    })
    it('Should fail when given a birthdate with month out of bounds', () => {
      expect(FinnishPic.validate('301398-1233')).to.equal(false)
    })

    it('Should fail when given a birthdate with date out of bounds in January', () => {
      expect(FinnishPic.validate('320198-123P')).to.equal(false)
    })

    it('Should fail when given a birthdate with date out of bounds in February, non leap year', () => {
      expect(FinnishPic.validate('290299-123U')).to.equal(false)
    })

    it('Should fail when given a birthdate with date out of bounds in February, a leap year', () => {
      expect(FinnishPic.validate('300204-123Y')).to.equal(false)
    })

    it('Should fail when given a birthdate with alphabets', () => {
      expect(FinnishPic.validate('0101AA-123A')).to.equal(false)
    })

    it('Should fail when given invalid separator chars', () => {
      const invalidSeparatorChars = 'ghijlmnopqrts1234567890'.split('')
      invalidSeparatorChars.forEach(invalidChar => {
        expect(FinnishPic.validate('010195' + invalidChar + '433X')).to.equal(false)
        expect(FinnishPic.validate('010195' + invalidChar.toUpperCase() + '433X')).to.equal(false)
      })
    })

    it('Should fail when given a too long date', () => {
      expect(FinnishPic.validate('01011995+433X')).to.equal(false)
    })

    it('Should fail when given a too short date', () => {
      expect(FinnishPic.validate('01015+433X')).to.equal(false)
    })

    it('Should fail when given a too long checksum part', () => {
      expect(FinnishPic.validate('010195+4433X')).to.equal(false)
    })

    it('Should fail when given a too short checksum part', () => {
      expect(FinnishPic.validate('010195+33X')).to.equal(false)
    })

    it('Should pass when given a valid PIC from 19th century', () => {
      expect(FinnishPic.validate('010195+433X')).to.equal(true)
    })

    it('Should pass when given a valid PIC from 20th century', () => {
      expect(FinnishPic.validate('010197+100P')).to.equal(true)
    })

    it('Should pass when given a valid PIC from 21st century', () => {
      expect(FinnishPic.validate('010114A173M')).to.equal(true)
    })

    it('Should pass when given a valid PIC with leap year, divisible only by 4', () => {
      expect(FinnishPic.validate('290296-7808')).to.equal(true)
    })

    it('Should fail when given a valid PIC with leap year, divisible by 100 and not by 400', () => {
      expect(FinnishPic.validate('290200-101P')).to.equal(false)
    })

    it('Should fail when given a PIC longer than 11 chars, bogus in the end', () => {
      expect(FinnishPic.validate('010114A173M ')).to.equal(false)
    })

    it('Should fail when given a PIC longer than 11 chars, bogus in the beginning', () => {
      expect(FinnishPic.validate(' 010114A173M')).to.equal(false)
    })

    it('Should pass when given a valid PIC with leap year, divisible by 100 and by 400', () => {
      expect(FinnishPic.validate('290200A248A')).to.equal(true)
    })
  })

  describe('#parse', () => {
    it('Should parse a valid PIC: male, born on leap year day 29.2.2000', () => {
      MockDate.set('2/2/2015')
      const parsed = FinnishPic.parse('290200A717E')
      expect(parsed.valid).to.equal(true)
      expect(parsed.sex).to.equal(FinnishPic.MALE)
      expect(parsed.dateOfBirth!.getFullYear()).to.equal(2000)
      expect(parsed.dateOfBirth!.getMonth() + 1).to.equal(2)
      expect(parsed.dateOfBirth!.getDate()).to.equal(29)
      expect(parsed.ageInYears).to.equal(14)
    })

    it('Should parse a valid PIC: female, born on 01.01.1999', () => {
      MockDate.set('2/2/2015')
      const parsed = FinnishPic.parse('010199-8148')
      expect(parsed.valid).to.equal(true)
      expect(parsed.sex).to.equal(FinnishPic.FEMALE)
      expect(parsed.dateOfBirth!.getFullYear()).to.equal(1999)
      expect(parsed.dateOfBirth!.getMonth() + 1).to.equal(1)
      expect(parsed.dateOfBirth!.getDate()).to.equal(1)
      expect(parsed.ageInYears).to.equal(16)
    })

    it('Should parse a valid PIC: female, born on 31.12.2010', () => {
      MockDate.set('2/2/2015')
      const parsed = FinnishPic.parse('311210A540N')
      expect(parsed.valid).to.equal(true)
      expect(parsed.sex).to.equal(FinnishPic.FEMALE)
      expect(parsed.dateOfBirth!.getFullYear()).to.equal(2010)
      expect(parsed.dateOfBirth!.getMonth() + 1).to.equal(12)
      expect(parsed.dateOfBirth!.getDate()).to.equal(31)
      expect(parsed.ageInYears).to.equal(4)
    })

    it('Should parse a valid PIC: male, born on 2.2.1888, having a birthday today', () => {
      MockDate.set('2/2/2015')
      const parsed = FinnishPic.parse('020288+9818')
      expect(parsed.valid).to.equal(true)
      expect(parsed.sex).to.equal(FinnishPic.MALE)
      expect(parsed.dateOfBirth!.getFullYear()).to.equal(1888)
      expect(parsed.dateOfBirth!.getMonth() + 1).to.equal(2)
      expect(parsed.dateOfBirth!.getDate()).to.equal(2)
      expect(parsed.ageInYears).to.equal(127)
    })

    it('Should parse a valid PIC: female 0 years, born on 31.12.2015', () => {
      MockDate.set('1/1/2016')
      const parsed = FinnishPic.parse('311215A000J')
      expect(parsed.valid).to.equal(true)
      expect(parsed.sex).to.equal(FinnishPic.FEMALE)
      expect(parsed.dateOfBirth!.getFullYear()).to.equal(2015)
      expect(parsed.dateOfBirth!.getMonth() + 1).to.equal(12)
      expect(parsed.dateOfBirth!.getDate()).to.equal(31)
      expect(parsed.ageInYears).to.equal(0)
    })

    it('Should parse age properly when birthdate is before current date', () => {
      MockDate.set('01/13/2017')
      const parsed = FinnishPic.parse('130195-1212')
      expect(parsed.ageInYears).to.equal(22)
    })

    it('Should parse age properly when birthdate is on current date', () => {
      MockDate.set('01/13/2017')
      const parsed = FinnishPic.parse('130195-1212')
      expect(parsed.ageInYears).to.equal(22)
    })

    it('Should parse age properly when birthdate is after current date', () => {
      MockDate.set('01/13/2017')
      const parsed = FinnishPic.parse('150295-1212')
      expect(parsed.ageInYears).to.equal(21)
    })

    it('Should detect an invalid PIC, lowercase checksum char', () => {
      MockDate.set('2/2/2015')
      expect(() => {
        FinnishPic.parse('311210A540n')
      }).to.throw(/Not valid PIC format/)
    })

    it('Should detect an invalid PIC with invalid checksum born 17.8.1995', () => {
      MockDate.set('12/12/2015')
      const parsed = FinnishPic.parse('150295-1212')
      expect(parsed.valid).to.equal(false)
    })

    it('Should detect an invalid PIC with month out of bounds', () => {
      expect(() => {
        FinnishPic.parse('301398-1233')
      }).to.throw(/Not valid PIC/)
    })

    it('Should detect an invalid PIC with day of month out of bounds', () => {
      expect(() => {
        FinnishPic.parse('330198-123X')
      }).to.throw(/Not valid PIC/)
    })

    it('Should accept new separators', () => {
      const validPICs = [
        '010594Y9021',
        '020594X903P',
        '020594X902N',
        '030594W903B',
        '030694W9024',
        '040594V9030',
        '040594V902Y',
        '050594U903M',
        '050594U902L',
        '010516B903X',
        '010516B902W',
        '020516C903K',
        '020516C902J',
        '030516D9037',
        '030516D9026',
        '010501E9032',
        '020502E902X',
        '020503F9037',
        '020504A902E',
        '020504B904H',
      ]
      validPICs.forEach((pic) => {
        expect(FinnishPic.validate(pic)).is.true
      })
    })
  })

  describe('#generateWithAge', () => {
    it('Should not accept zero age', () => {
      expect(() => {
        FinnishPic.generateWithAge(0)
      }).to.throw(/not between sensible age range/)
    })

    it('Should not accept age >= 200', () => {
      expect(() => {
        FinnishPic.generateWithAge(201)
      }).to.throw(/not between sensible age range/)
    })

    it('Should generate a valid PIC with birth year in the 21st century', () => {
      MockDate.set('2/2/2015')
      const age = 3
      expect(FinnishPic.generateWithAge(age)).to.match(new RegExp('\\d{4}1[12][A-F][\\d]{3}[A-Z0-9]'))
    })

    it('Should generate a valid PIC with birth year in the 20th century', () => {
      MockDate.set('2/2/2015')
      const age = 20
      expect(FinnishPic.generateWithAge(age)).to.match(new RegExp('\\d{4}9[45][YXWVU-][\\d]{3}[A-Z0-9]'))
    })

    it('Should generate a valid PIC with birth year in the 19th century', () => {
      MockDate.set('2/2/2015')
      const age = 125
      expect(FinnishPic.generateWithAge(age)).to.match(new RegExp('\\d{4}[(89)|(90)]\\+[\\d]{3}[A-Z0-9]'))
    })

    it('Should generate a valid PIC with birth year 2000', () => {
      MockDate.set('12/31/2015')
      const age = new Date().getFullYear() - 2000
      expect(FinnishPic.generateWithAge(age)).to.match(new RegExp('\\d{4}00[A-F][\\d]{3}[A-Z0-9]'))
    })

    it('Should generate a valid PIC with birth year 1999', () => {
      MockDate.set('12/31/2015')
      const age = new Date().getFullYear() - 1999
      expect(FinnishPic.generateWithAge(age)).to.match(new RegExp('\\d{4}99[YXWVU-][\\d]{3}[A-Z0-9]'))
    })

    it('Should generate a valid PIC with birth year 1990', () => {
      MockDate.set('12/31/2015')
      const age = 25
      expect(FinnishPic.generateWithAge(age)).to.match(new RegExp('\\d{4}90[YXWVU-][\\d]{3}[A-Z0-9]'))
    })

    it('Should generate random birth dates', () => {
      const getDayAndMonth = (pic: string) => pic.substr(0, 4)

      const picsToCompare = 10,
        age = 50

      const referenceBirthDate = getDayAndMonth(FinnishPic.generateWithAge(age))
      let i = 0,
        differenceFound = false

      do {
        const birthDate = getDayAndMonth(FinnishPic.generateWithAge(age))
        differenceFound = referenceBirthDate !== birthDate
        i++
      } while (!differenceFound && i < picsToCompare)

      expect(differenceFound).to.be.true
    })

    it('Should generate valid birth dates', () => {
      const centuryMap: Map<string, number> = new Map()
      centuryMap.set('A', 2000)
      centuryMap.set('-', 1900)
      centuryMap.set('+', 2800)
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        picsToGenerate = 1000,
        age = 40

      for (let i = 0; i < picsToGenerate; i++) {
        const pic = FinnishPic.generateWithAge(age)

        const month = parseInt(pic.substr(2, 2), 10)
        expect(month).to.satisfy((m: number) => m >= 1 && m <= 12, 'Month not between 1 and 12')

        const day = parseInt(pic.substr(0, 2), 10)

        let daysInMonthMax = daysInMonth[month - 1]
        if (month === 2) {
          const centuryChar = pic.substr(6, 1)
          const year = centuryMap.get(centuryChar)! + parseInt(pic.substr(4, 2), 10)
          if (FinnishPic.isLeapYear(year)) {
            daysInMonthMax++
          }
        }
        expect(day).to.satisfy((d: number) => d >= 1 && d <= daysInMonthMax, "Day not between 1 and month's maximum")
      }
    })

    it('Should generate random birth dates with correct (i.e. given) age', () => {
      const age = 25,
        picsToGenerate = 100

      for (let i = 0; i < picsToGenerate; i++) {
        const pic = FinnishPic.generateWithAge(age)
        const generatedAge = FinnishPic.parse(pic).ageInYears
        expect(generatedAge).to.equal(age)
      }
    })
  })
})
