import { sqlite } from "../../db/sqlite";


export async function saveProjects(payload: any) {
    try {
        const {
            projects,
            selected_projects:
            selectedProjects,
            latest_fetch,
            user_id
        } = payload;

        console.log("Saving projects:", { payload })

        if (!selectedProjects 
            || !Array.isArray(selectedProjects) 
            || selectedProjects.length === 0
        ) {
            throw new Error("Invalid projects data");
        }

        let accum_changes = 0;

        // Async adding each project to DB 
        selectedProjects.forEach(async (project: any) => {
            const create_time = new Date(project.createTime).getTime();
            const labels = JSON.stringify(project.labels);
            const lifecycle_state = project.lifecycleState;
            const name = project.name;
            const project_id = project.projectId;
            const project_number = project.projectNumber;
            const id = user_id + "_" + project_id; // Unique ID for the project

            // Insert or update the projects in the database
            const { changes } = sqlite.run(
                `INSERT INTO USER_RESOURCE_GCP_PROJECT 
                    (
                        id,
                        user_id,
                        project_id,
                        project_number,
                        name,
                        lifecycle_state,
                        labels,
                        create_time
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET 
                        user_id = excluded.user_id,
                        project_id = excluded.project_id,
                        project_number = excluded.project_number,
                        name = excluded.name,
                        lifecycle_state = excluded.lifecycle_state,
                        labels = excluded.labels,
                        create_time = excluded.create_time
                    RETURNING *
                `,
                [
                    id,
                    user_id,
                    project_id,
                    project_number,
                    name,
                    lifecycle_state,
                    labels,
                    create_time
                ]
            );

            accum_changes += changes;
        
        })

        // Example structure of selectedProjects:
        // {
            // project_id: string
            // project_number: string
            // name: string
            // lifecycle_state: string
            // labels: JSON
            // create_time: number
        // }


        return { success: accum_changes > 0 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function loadProjects(payload: any) {
    try {
        const {
            user_id
        } = payload;

        if (!user_id) {
            throw new Error("Invalid required data: user_id");
        }

        const result = sqlite.query(`
            SELECT * 
            FROM USER_RESOURCE_GCP_PROJECT
            WHERE user_id = ?
            ORDER BY create_time DESC
            `
        ).all([user_id]);

        return { success: true, projects: result || [] };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

