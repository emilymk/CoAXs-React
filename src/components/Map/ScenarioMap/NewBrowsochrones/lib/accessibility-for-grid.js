/**
 * Get the cumulative accessibility number for a cutoff from a travel time surface.
 * This function always calculates _average_ accessibility. Calculating best or worst case accessibility is computationally
 * complex because you must individually calculate accessibility for every minute, save all of those values, and then take a minumum.
 * (Saving the worst-case travel time to each pixel allows you to calculate a bound, but does not allow calculation of the true minimum, because
 * it is possible that all the worst-case travel times cannot appear simultaneously. Of course this comes back to the definition of your measure, and
 * how fungible you consider opportunities to be.)
 *
 * The cutoff used is the cutoff that was specified in the surface generation. If you want a different cutoff you must regenerate the surface. The reason
 * for this is that we need to know at every minute whether each destination was reached within a certain amount of time. Storing this for every possible
 * cutoff is not feasible (the data become too large), so we only store it for a single cutoff during surface generation. However, calculating accessibility
 * for additional grids should only take milliseconds.
 *
 * @param {Number} cutoff
 * @param {Object} surface
 * @param {Object} grid
 * @returns {Number} accessibility
 */

export default function accessibilityForGrid ({
  cutoff = 60,
  grid,
  surface
}) {
  const query = surface.query

  let accessibility = 0
  for (let y = 0, pixel = 0; y < query.height; y++) {
    for (let x = 0; x < query.width; x++, pixel++) {
      const travelTime = surface.surface[pixel]

      // ignore unreached locations
      // TODO in OTP/R5 we have a sigmoidal cutoff here to avoid "echoes" of high density locations
      // at 60 minutes travel time from their origins.
      // But maybe also we just want to not represent these things as hard edges since accessibility
      // is a continuous phenomenon. No one is saying "ah, rats, it takes 60 minutes and 10 seconds
      // to get work, I have to find a job that's 20 meters closer to home..."
      if (travelTime <= cutoff) {
        const gridx = x + query.west - grid.west
        const gridy = y + query.north - grid.north
        if (grid.contains(gridx, gridy)) {
          // get value of this pixel from grid
          accessibility += grid.data[gridy * grid.width + gridx]
        }
      }
    }
  }

  return accessibility
}
