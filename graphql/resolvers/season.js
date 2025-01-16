import { Season } from '../../rest/models/Season.js';

const buildFilterConditions = (filter) => {
    const conditions = {};
    if (!filter) return conditions;

    // Filtrowanie po latach sezonu
    if (filter.years) {
        const { eq, ne, contains, notContains } = filter.years;
        if (eq) conditions.years = eq;
        if (ne) conditions.years = { $ne: ne };
        if (contains) conditions.years = { $regex: contains, $options: 'i' };
        if (notContains) conditions.years = { $not: new RegExp(notContains, 'i') };
    }

    // Filtrowanie po trenerze
    if (filter.manager) conditions.manager = filter.manager;

    // Filtrowanie po statusie sezonu
    if (filter.status) conditions.status = filter.status;

    return conditions;
};

const seasonResolvers = {
    Query: {
        seasons: async (_, { filter, sort, pagination }) => {
            try {
                // Budujemy zapytanie z warunkami filtrowania
                let query = Season.find(buildFilterConditions(filter));

                // Populacja powiązanych danych
                query = query
                    .populate('trophies')    // Populacja zdobytych trofeów
                    .populate('manager');    // Populacja managera sezonu

                // Implementacja sortowania
                if (sort) {
                    const sortDirection = sort.direction === 'DESC' ? -1 : 1;
                    query = query.sort({ [sort.field]: sortDirection });
                }

                // Implementacja paginacji
                if (pagination) {
                    const { page, pageSize } = pagination;
                    query = query.skip((page - 1) * pageSize).limit(pageSize);
                }

                return await query.exec();
            } catch (error) {
                throw new Error(`Error fetching seasons: ${error.message}`);
            }
        },

        season: async (_, { id }) => {
            try {
                // Pobieranie konkretnego sezonu z populacją powiązanych danych
                const season = await Season.findById(id)
                    .populate('trophies')    // Populacja zdobytych trofeów
                    .populate('manager');    // Populacja managera sezonu

                if (!season) {
                    throw new Error('Season not found');
                }

                return season;
            } catch (error) {
                throw new Error(`Error fetching season: ${error.message}`);
            }
        }
    },

    Mutation: {
        createSeason: async (_, { input }) => {
            try {
                // Tworzenie nowego sezonu
                const season = new Season({
                    ...input,
                    trophies: []  // Inicjalizacja pustej listy trofeów
                });

                // Zapis sezonu
                await season.save();

                return season;
            } catch (error) {
                throw new Error(`Error creating season: ${error.message}`);
            }
        },

        updateSeason: async (_, { id, input }) => {
            try {
                // Aktualizacja sezonu
                const season = await Season.findByIdAndUpdate(
                    id,
                    { $set: input },
                    {
                        new: true,            // Zwraca zaktualizowany dokument
                        runValidators: true   // Uruchamia walidatory schematu
                    }
                )
                    .populate('trophies')
                    .populate('manager');

                if (!season) {
                    throw new Error('Season not found');
                }

                return season;
            } catch (error) {
                throw new Error(`Error updating season: ${error.message}`);
            }
        },

        deleteSeason: async (_, { id }) => {
            try {
                // Usuwanie sezonu
                const result = await Season.findByIdAndDelete(id);

                // Zwraca true jeśli sezon został usunięty, false jeśli nie istniał
                return !!result;
            } catch (error) {
                throw new Error(`Error deleting season: ${error.message}`);
            }
        }
    },

    // Dodatkowe resolvery pól (jeśli potrzebne)
    Season: {

    }
};

export default seasonResolvers;