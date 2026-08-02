const APPROXIMATE_MILESTONES = [7, 10, 15, 20, 25, 30, 40, 50] as const;

export function marriageYearRange(currentYear = new Date().getFullYear()) {
  return {
    min: currentYear - 80,
    max: currentYear + 10,
  };
}

export function parseMarriageYear(
  value: string,
  currentYear = new Date().getFullYear(),
) {
  if (!/^\d{4}$/.test(value.trim())) return null;

  const year = Number(value);
  const range = marriageYearRange(currentYear);

  return year >= range.min && year <= range.max ? year : null;
}

export function formatMarriageYear(
  marriageYear: number,
  currentYear = new Date().getFullYear(),
) {
  if (marriageYear > currentYear) return "결혼전";

  const years = currentYear - marriageYear;
  if (years <= 1) return "신혼";
  if (years <= 5) return `결혼 ${years}년 차`;

  const milestone =
    years > 50
      ? Math.round(years / 10) * 10
      : APPROXIMATE_MILESTONES.reduce((closest, candidate) =>
          Math.abs(candidate - years) < Math.abs(closest - years)
            ? candidate
            : closest,
        );

  return `결혼 약 ${milestone}년 차`;
}
